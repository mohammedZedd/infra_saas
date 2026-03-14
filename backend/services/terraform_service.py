from __future__ import annotations

import asyncio
import os
import re
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from db.models.project import TerraformRun
from repository.run import complete_run


# ── Sync execution (runs in thread pool via asyncio.to_thread) ─────────────────


def _run_terraform_sync(command: str, files: list, project_id: str) -> dict:
    """Write project files to a temp dir and execute terraform.
    Returns a result dict; never raises — all errors are captured as failed status.
    """
    lines: list[str] = []

    with tempfile.TemporaryDirectory(prefix=f"cf_{project_id}_") as tmpdir:

        # ── Write .tf / .tfvars files to disk ─────────────────────────────────
        tf_written = 0
        for f in files:
            if f.is_directory or not f.content:
                continue
            if not f.path.endswith((".tf", ".tfvars")):
                continue
            dest = Path(tmpdir) / f.path.lstrip("/")
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(f.content, encoding="utf-8")
            tf_written += 1

        ts = _ts()
        if tf_written == 0:
            return _failed(
                lines,
                f"[{ts}] No Terraform (.tf) files found in project. "
                "Add Terraform files in the Code tab first.",
                "No Terraform files found",
            )

        env = {
            **os.environ,
            "TF_IN_AUTOMATION": "1",
            "CHECKPOINT_DISABLE": "1",
        }

        # ── Step 1: terraform init ─────────────────────────────────────────────
        lines += [f"[{_ts()}] $ terraform init -no-color", ""]
        try:
            init = subprocess.run(
                ["terraform", "init", "-no-color", "-input=false"],
                cwd=tmpdir,
                env=env,
                capture_output=True,
                text=True,
                timeout=120,
            )
            lines += init.stdout.splitlines()
            if init.returncode != 0:
                lines += init.stderr.splitlines()
                lines += ["", f"[{_ts()}] Error: terraform init failed (exit {init.returncode})"]
                return _failed(lines, "", "terraform init failed")
        except subprocess.TimeoutExpired:
            return _failed(lines, f"[{_ts()}] Error: terraform init timed out (120 s)", "terraform init timed out")

        # ── Step 2: run plan / apply / destroy ────────────────────────────────
        cmd = ["terraform", command, "-no-color", "-input=false"]
        if command in {"apply", "destroy"}:
            cmd.append("-auto-approve")

        lines += ["", f"[{_ts()}] $ {' '.join(cmd)}", ""]

        try:
            proc = subprocess.Popen(
                cmd,
                cwd=tmpdir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
            raw: list[str] = []
            for line in proc.stdout:
                raw.append(line.rstrip("\n"))
            proc.wait(timeout=300)
            lines += raw
            full_output = "\n".join(raw)
        except subprocess.TimeoutExpired:
            proc.kill()
            return _failed(
                lines,
                f"[{_ts()}] Error: terraform {command} timed out (300 s)",
                f"terraform {command} timed out",
            )

        # ── Parse summary and finish ───────────────────────────────────────────
        add, change, destroy = _parse_summary(full_output, command)

        if proc.returncode == 0:
            lines += ["", f"[{_ts()}] Terraform {command} completed successfully."]
            return {
                "logs": "\n".join(lines),
                "status": "success",
                "error_message": None,
                "plan_add": add,
                "plan_change": change,
                "plan_destroy": destroy,
            }
        else:
            lines += ["", f"[{_ts()}] Error: terraform {command} exited with code {proc.returncode}."]
            return {
                "logs": "\n".join(lines),
                "status": "failed",
                "error_message": f"exit code {proc.returncode}",
                "plan_add": add,
                "plan_change": change,
                "plan_destroy": destroy,
            }


# ── Helpers ────────────────────────────────────────────────────────────────────


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _failed(lines: list[str], extra_line: str, error_message: str) -> dict:
    if extra_line:
        lines.append(extra_line)
    return {
        "logs": "\n".join(lines),
        "status": "failed",
        "error_message": error_message,
        "plan_add": 0,
        "plan_change": 0,
        "plan_destroy": 0,
    }


def _parse_summary(output: str, command: str) -> tuple[int, int, int]:
    """Extract add / change / destroy counts from terraform stdout."""
    # Plan: 2 to add, 1 to change, 0 to destroy.
    m = re.search(r"Plan:\s+(\d+) to add,\s+(\d+) to change,\s+(\d+) to destroy", output)
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3))

    # Apply complete! Resources: 2 added, 1 changed, 0 destroyed.
    m = re.search(r"Apply complete!.*?(\d+) added,\s+(\d+) changed,\s+(\d+) destroyed", output, re.S)
    if m:
        return int(m.group(1)), int(m.group(2)), int(m.group(3))

    # Destroy complete! Resources: 3 destroyed.
    m = re.search(r"Destroy complete!.*?(\d+) destroyed", output, re.S)
    if m:
        return 0, 0, int(m.group(1))

    return 0, 0, 0


# ── Async entry point ──────────────────────────────────────────────────────────


async def execute_terraform(
    db: AsyncSession,
    run: TerraformRun,
    project_id,
    command: str,
) -> TerraformRun:
    """Fetch project files from DB, run terraform in a thread pool, update the run."""
    from repository.file import list_project_files

    # Fetch files in async context BEFORE entering the thread
    files, _ = await list_project_files(db, project_id)

    # Block in thread pool — keeps the asyncio event loop free
    result = await asyncio.to_thread(
        _run_terraform_sync,
        command,
        files,
        str(project_id),
    )

    return await complete_run(
        db,
        run,
        status=result["status"],
        logs=result["logs"],
        plan_add=result["plan_add"],
        plan_change=result["plan_change"],
        plan_destroy=result["plan_destroy"],
        error_message=result.get("error_message"),
    )

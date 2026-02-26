import useEditorStore from "../../stores/useEditorStore"
import type { TerraformBackend } from "../../types/workspace"

export default function SettingsPanel() {
  const settings = useEditorStore((s) => s.settings)
  const updateBackend = useEditorStore((s) => s.updateBackend)
  const setTerraformVersion = useEditorStore((s) => s.setTerraformVersion)
  const updateProvider = useEditorStore((s) => s.updateProvider)

  const backendTypes = ["local", "s3", "remote", "gcs", "azurerm"] as const

  return (
    <div style={{ padding: "16px" }}>
      {/* Terraform Version */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          Terraform Version
        </label>
        <select
          value={settings.terraformVersion}
          onChange={(e) => setTerraformVersion(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "12px",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            outline: "none",
          }}
        >
          <option value="1.6.0">1.6.0</option>
          <option value="1.5.7">1.5.7</option>
          <option value="1.4.6">1.4.6</option>
          <option value="1.3.9">1.3.9</option>
        </select>
      </div>

      {/* AWS Provider */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          AWS Provider
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="text"
            placeholder="Version (e.g. ~> 5.0)"
            value={settings.providers[0]?.version || ""}
            onChange={(e) => updateProvider(0, { version: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="Region"
            value={settings.providers[0]?.region || ""}
            onChange={(e) => updateProvider(0, { region: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="Profile (optional)"
            value={settings.providers[0]?.profile || ""}
            onChange={(e) => updateProvider(0, { profile: e.target.value })}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Backend */}
      <div>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          Backend
        </label>
        <select
          value={settings.backend.type}
          onChange={(e) => updateBackend({ type: e.target.value as TerraformBackend["type"], config: {} })}
          style={{
            width: "100%",
            padding: "8px",
            fontSize: "12px",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            outline: "none",
            marginBottom: "8px",
          }}
        >
          {backendTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* S3 Backend Config */}
        {settings.backend.type === "s3" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "10px", backgroundColor: "#F9FAFB", borderRadius: "6px" }}>
            <input
              type="text"
              placeholder="Bucket name"
              value={settings.backend.config.bucket || ""}
              onChange={(e) => updateBackend({ ...settings.backend, config: { ...settings.backend.config, bucket: e.target.value } })}
              style={{ width: "100%", padding: "6px 8px", fontSize: "12px", border: "1px solid #D1D5DB", borderRadius: "4px", outline: "none" }}
            />
            <input
              type="text"
              placeholder="Key (e.g. terraform.tfstate)"
              value={settings.backend.config.key || ""}
              onChange={(e) => updateBackend({ ...settings.backend, config: { ...settings.backend.config, key: e.target.value } })}
              style={{ width: "100%", padding: "6px 8px", fontSize: "12px", border: "1px solid #D1D5DB", borderRadius: "4px", outline: "none" }}
            />
            <input
              type="text"
              placeholder="Region"
              value={settings.backend.config.region || ""}
              onChange={(e) => updateBackend({ ...settings.backend, config: { ...settings.backend.config, region: e.target.value } })}
              style={{ width: "100%", padding: "6px 8px", fontSize: "12px", border: "1px solid #D1D5DB", borderRadius: "4px", outline: "none" }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
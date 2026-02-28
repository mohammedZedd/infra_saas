// src/components/editor/modals/ec2/steps/StepSummary.tsx

import React from 'react';
import type { EC2FullConfig } from '../types/ec2-config';

interface StepSummaryProps {
  config: EC2FullConfig;
}

const StepSummary: React.FC<StepSummaryProps> = ({ config }) => {
  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e8eaed',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: '#16191f',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '6px 0',
    borderBottom: '1px solid #f5f5f5',
    fontSize: 13,
  };

  const keyStyle: React.CSSProperties = {
    color: '#687078',
    minWidth: 180,
    flexShrink: 0,
  };

  const valStyle: React.CSSProperties = {
    color: '#16191f',
    fontWeight: 500,
    textAlign: 'right',
    wordBreak: 'break-all',
  };

  const monoVal: React.CSSProperties = {
    ...valStyle,
    fontFamily: 'monospace',
    fontSize: 12,
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    padding: '2px 8px',
    background: color,
    color: '#fff',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    display: 'inline-block',
  });

  // ── Cost calculation ──
  const storageCostPerGBMonth: Record<string, number> = {
    gp2: 0.10,
    gp3: 0.08,
    io1: 0.125,
    io2: 0.125,
    standard: 0.05,
    sc1: 0.015,
    st1: 0.045,
  };

  const instanceHourly = config.instanceTypeData?.pricePerHour || 0;
  const instanceMonthly = instanceHourly * 730;
  const rootStorageCost =
    config.rootBlockDevice.volumeSize *
    (storageCostPerGBMonth[config.rootBlockDevice.volumeType] || 0.08);
  const ebsStorageCost = config.ebsBlockDevices.reduce(
    (sum, v) => sum + v.volumeSize * (storageCostPerGBMonth[v.volumeType] || 0.08),
    0
  );
  const monitoringCost = config.monitoring ? 3.5 : 0;
  const perInstanceMonthly =
    instanceMonthly + rootStorageCost + ebsStorageCost + monitoringCost;
  const totalMonthly = perInstanceMonthly * config.numberOfInstances;

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#16191f', marginBottom: 4 }}>
        Summary
      </div>
      <div style={{ fontSize: 13, color: '#687078', marginBottom: 20 }}>
        Review your EC2 instance configuration before saving.
      </div>

      {/* ── Cost banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #232f3e 0%, #37475a 100%)',
          borderRadius: 10,
          padding: 20,
          marginBottom: 16,
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
          Estimated monthly cost
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 36, fontWeight: 800 }}>
            ${totalMonthly.toFixed(2)}
          </span>
          <span style={{ fontSize: 14, opacity: 0.7 }}>/month</span>
        </div>
        {config.numberOfInstances > 1 && (
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            ${perInstanceMonthly.toFixed(2)}/mo × {config.numberOfInstances} instances
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 14,
            fontSize: 12,
            opacity: 0.8,
          }}
        >
          <span>
            💻 Compute: $
            {(instanceMonthly * config.numberOfInstances).toFixed(2)}
          </span>
          <span>
            💾 Storage: $
            {((rootStorageCost + ebsStorageCost) * config.numberOfInstances).toFixed(2)}
          </span>
          {config.monitoring && (
            <span>
              📊 Monitoring: $
              {(monitoringCost * config.numberOfInstances).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* ── Name & Tags ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>🏷️</span> Name and tags
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Name</span>
          <span style={valStyle}>{config.name || '—'}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Number of instances</span>
          <span style={valStyle}>{config.numberOfInstances}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Tags</span>
          <span style={valStyle}>
            {Object.keys(config.tags).length > 0
              ? Object.entries(config.tags)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(', ')
              : '—'}
          </span>
        </div>
      </div>

      {/* ── AMI ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>💿</span> AMI
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>AMI ID</span>
          <span style={monoVal}>{config.ami || '—'}</span>
        </div>
        {config.amiData && (
          <>
            <div style={rowStyle}>
              <span style={keyStyle}>Name</span>
              <span style={valStyle}>{config.amiData.name}</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>Platform / Arch</span>
              <span style={valStyle}>
                <span style={badgeStyle('#0d6efd')}>{config.amiData.platform}</span>{' '}
                <span style={badgeStyle('#198754')}>{config.amiData.architecture}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Instance Type ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>⚡</span> Instance type
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Type</span>
          <span style={{ ...monoVal, fontWeight: 700 }}>{config.instanceType}</span>
        </div>
        {config.instanceTypeData && (
          <>
            <div style={rowStyle}>
              <span style={keyStyle}>Family</span>
              <span style={valStyle}>{config.instanceTypeData.family}</span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>vCPUs / Memory</span>
              <span style={valStyle}>
                {config.instanceTypeData.vCPUs} vCPU · {config.instanceTypeData.memory} GiB
              </span>
            </div>
            <div style={rowStyle}>
              <span style={keyStyle}>Hourly rate</span>
              <span style={valStyle}>
                ${config.instanceTypeData.pricePerHour.toFixed(4)}/hr
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Key Pair ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>🔑</span> Key pair
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Key pair name</span>
          <span style={valStyle}>
            {config.keyName || 'No key pair (not recommended)'}
          </span>
        </div>
      </div>

      {/* ── Network ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>🌐</span> Network
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>VPC</span>
          <span style={monoVal}>{config.vpcId || '—'}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Subnet</span>
          <span style={monoVal}>{config.subnetId || 'No preference'}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Public IP</span>
          <span style={valStyle}>
            {config.associatePublicIpAddress === null
              ? 'Subnet default'
              : config.associatePublicIpAddress
                ? 'Enabled'
                : 'Disabled'}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Security groups</span>
          <span style={monoVal}>
            {config.vpcSecurityGroupIds.length > 0
              ? config.vpcSecurityGroupIds.join(', ')
              : '—'}
          </span>
        </div>
        {config.privateIp && (
          <div style={rowStyle}>
            <span style={keyStyle}>Private IP</span>
            <span style={monoVal}>{config.privateIp}</span>
          </div>
        )}
      </div>

      {/* ── Storage ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>💾</span> Storage
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Root volume</span>
          <span style={valStyle}>
            {config.rootBlockDevice.volumeSize} GiB{' '}
            {config.rootBlockDevice.volumeType.toUpperCase()}
            {config.rootBlockDevice.encrypted && ' 🔐'}
          </span>
        </div>
        {config.rootBlockDevice.iops && (
          <div style={rowStyle}>
            <span style={keyStyle}>Root IOPS</span>
            <span style={valStyle}>{config.rootBlockDevice.iops}</span>
          </div>
        )}
        <div style={rowStyle}>
          <span style={keyStyle}>Additional EBS volumes</span>
          <span style={valStyle}>{config.ebsBlockDevices.length}</span>
        </div>
        {/* ✅ FIX: removed unused `i` parameter */}
        {config.ebsBlockDevices.map((vol) => (
          <div key={vol.id} style={rowStyle}>
            <span style={keyStyle}>&nbsp;&nbsp;{vol.deviceName}</span>
            <span style={valStyle}>
              {vol.volumeSize} GiB {vol.volumeType.toUpperCase()}
              {vol.encrypted && ' 🔐'}
            </span>
          </div>
        ))}
        <div style={rowStyle}>
          <span style={keyStyle}>Ephemeral volumes</span>
          <span style={valStyle}>{config.ephemeralBlockDevices.length}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>EBS optimized</span>
          <span style={valStyle}>{config.ebsOptimized ? 'Yes' : 'No'}</span>
        </div>
      </div>

      {/* ── Advanced ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>⚙️</span> Advanced
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>IAM profile</span>
          <span style={valStyle}>{config.iamInstanceProfile || '—'}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Monitoring</span>
          <span style={valStyle}>{config.monitoring ? 'Detailed' : 'Basic'}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>User data</span>
          <span style={valStyle}>
            {config.userData ? `${config.userData.split('\n').length} lines` : '—'}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Purchasing</span>
          <span style={valStyle}>
            {config.instanceMarketOptions ? (
              <span style={badgeStyle('#ff9900')}>Spot</span>
            ) : (
              'On-Demand'
            )}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Metadata (IMDSv2)</span>
          <span style={valStyle}>
            {config.metadataOptions.httpTokens === 'required' ? 'Required' : 'Optional'}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Tenancy</span>
          <span style={valStyle}>{config.tenancy}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Termination protection</span>
          <span style={valStyle}>
            {config.disableApiTermination ? (
              <span style={badgeStyle('#198754')}>Enabled</span>
            ) : (
              'Disabled'
            )}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Shutdown behavior</span>
          <span style={valStyle}>{config.instanceInitiatedShutdownBehavior}</span>
        </div>
        <div style={rowStyle}>
          <span style={keyStyle}>Hibernation</span>
          <span style={valStyle}>{config.hibernation ? 'Enabled' : 'Disabled'}</span>
        </div>
        {config.placementGroup && (
          <div style={rowStyle}>
            <span style={keyStyle}>Placement group</span>
            <span style={valStyle}>{config.placementGroup}</span>
          </div>
        )}
        {config.enclaveOptions.enabled && (
          <div style={rowStyle}>
            <span style={keyStyle}>Nitro Enclaves</span>
            <span style={valStyle}>
              <span style={badgeStyle('#6f42c1')}>Enabled</span>
            </span>
          </div>
        )}
        {config.launchTemplate?.id && (
          <div style={rowStyle}>
            <span style={keyStyle}>Launch template</span>
            <span style={monoVal}>{config.launchTemplate.id}</span>
          </div>
        )}
      </div>

      {/* ── Terraform HCL Preview ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <span>📄</span> Terraform preview
        </div>
        <pre
          style={{
            background: '#1e1e2e',
            color: '#cdd6f4',
            borderRadius: 8,
            padding: 16,
            fontSize: 12,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            lineHeight: 1.6,
            overflow: 'auto',
            maxHeight: 300,
            margin: 0,
          }}
        >
          {generateHCLPreview(config)}
        </pre>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ FIX: Single generateHCLPreview function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function generateHCLPreview(config: EC2FullConfig): string {
  const resourceName = config.name
    ? config.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    : 'example';

  const lines: string[] = [];
  lines.push(`resource "aws_instance" "${resourceName}" {`);

  // ── Top-level arguments ──
  if (config.ami) lines.push(`  ami           = "${config.ami}"`);
  if (config.instanceType) lines.push(`  instance_type = "${config.instanceType}"`);
  if (config.keyName) lines.push(`  key_name      = "${config.keyName}"`);
  if (config.subnetId) lines.push(`  subnet_id     = "${config.subnetId}"`);
  if (config.availabilityZone) {
    lines.push(`  availability_zone = "${config.availabilityZone}"`);
  }

  if (config.associatePublicIpAddress !== null) {
    lines.push(`  associate_public_ip_address = ${config.associatePublicIpAddress}`);
  }

  if (config.vpcSecurityGroupIds.length > 0) {
    const sgList = config.vpcSecurityGroupIds.map((s) => `"${s}"`).join(', ');
    lines.push(`  vpc_security_group_ids = [${sgList}]`);
  }

  if (config.privateIp) lines.push(`  private_ip = "${config.privateIp}"`);
  if (config.iamInstanceProfile) {
    lines.push(`  iam_instance_profile = "${config.iamInstanceProfile}"`);
  }
  if (config.monitoring) lines.push(`  monitoring = true`);
  if (config.ebsOptimized) lines.push(`  ebs_optimized = true`);
  if (config.disableApiTermination) lines.push(`  disable_api_termination = true`);
  if (config.disableApiStop) lines.push(`  disable_api_stop = true`);

  if (config.instanceInitiatedShutdownBehavior !== 'stop') {
    lines.push(
      `  instance_initiated_shutdown_behavior = "${config.instanceInitiatedShutdownBehavior}"`
    );
  }

  if (config.hibernation) lines.push(`  hibernation = true`);
  if (config.forceDestroy) lines.push(`  force_destroy = true`);
  if (!config.sourceDestCheck) lines.push(`  source_dest_check = false`);

  if (config.tenancy !== 'default') {
    lines.push(`  tenancy = "${config.tenancy}"`);
  }
  if (config.hostId) lines.push(`  host_id = "${config.hostId}"`);
  if (config.hostResourceGroupArn) {
    lines.push(`  host_resource_group_arn = "${config.hostResourceGroupArn}"`);
  }
  if (config.placementGroup) {
    lines.push(`  placement_group = "${config.placementGroup}"`);
  }
  if (config.placementPartitionNumber) {
    lines.push(`  placement_partition_number = ${config.placementPartitionNumber}`);
  }
  if (config.ipv6AddressCount > 0) {
    lines.push(`  ipv6_address_count = ${config.ipv6AddressCount}`);
  }
  if (config.enablePrimaryIpv6) lines.push(`  enable_primary_ipv6 = true`);
  if (config.getPasswordData) lines.push(`  get_password_data = true`);

  // ── User data ──
  if (config.userData) {
    lines.push('');
    lines.push(`  user_data = <<-EOF`);
    config.userData.split('\n').forEach((l) => lines.push(`    ${l}`));
    lines.push(`  EOF`);
    if (config.userDataReplaceOnChange) {
      lines.push(`  user_data_replace_on_change = true`);
    }
  } else if (config.userDataBase64) {
    lines.push(`  user_data_base64 = "${config.userDataBase64}"`);
  }

  // ── Root block device ──
  lines.push('');
  lines.push('  root_block_device {');
  lines.push(`    volume_type           = "${config.rootBlockDevice.volumeType}"`);
  lines.push(`    volume_size           = ${config.rootBlockDevice.volumeSize}`);
  if (config.rootBlockDevice.iops) {
    lines.push(`    iops                  = ${config.rootBlockDevice.iops}`);
  }
  if (config.rootBlockDevice.throughput) {
    lines.push(`    throughput             = ${config.rootBlockDevice.throughput}`);
  }
  lines.push(`    encrypted             = ${config.rootBlockDevice.encrypted}`);
  if (config.rootBlockDevice.kmsKeyId) {
    lines.push(`    kms_key_id            = "${config.rootBlockDevice.kmsKeyId}"`);
  }
  lines.push(
    `    delete_on_termination = ${config.rootBlockDevice.deleteOnTermination}`
  );
  if (Object.keys(config.rootBlockDevice.tags).length > 0) {
    lines.push('    tags = {');
    Object.entries(config.rootBlockDevice.tags).forEach(([k, v]) => {
      lines.push(`      ${k} = "${v}"`);
    });
    lines.push('    }');
  }
  lines.push('  }');

  // ── EBS block devices ──
  config.ebsBlockDevices.forEach((vol) => {
    lines.push('');
    lines.push('  ebs_block_device {');
    lines.push(`    device_name           = "${vol.deviceName}"`);
    lines.push(`    volume_type           = "${vol.volumeType}"`);
    lines.push(`    volume_size           = ${vol.volumeSize}`);
    if (vol.iops) lines.push(`    iops                  = ${vol.iops}`);
    if (vol.throughput) lines.push(`    throughput             = ${vol.throughput}`);
    lines.push(`    encrypted             = ${vol.encrypted}`);
    if (vol.kmsKeyId) lines.push(`    kms_key_id            = "${vol.kmsKeyId}"`);
    if (vol.snapshotId) lines.push(`    snapshot_id           = "${vol.snapshotId}"`);
    lines.push(`    delete_on_termination = ${vol.deleteOnTermination}`);
    if (Object.keys(vol.tags).length > 0) {
      lines.push('    tags = {');
      Object.entries(vol.tags).forEach(([k, v]) => {
        lines.push(`      ${k} = "${v}"`);
      });
      lines.push('    }');
    }
    lines.push('  }');
  });

  // ── Ephemeral block devices ──
  config.ephemeralBlockDevices.forEach((dev) => {
    lines.push('');
    lines.push('  ephemeral_block_device {');
    lines.push(`    device_name  = "${dev.deviceName}"`);
    if (dev.virtualName) lines.push(`    virtual_name = "${dev.virtualName}"`);
    if (dev.noDevice) lines.push(`    no_device = true`);
    lines.push('  }');
  });

  // ── CPU options ──
  if (
    config.cpuOptions?.coreCount ||
    config.cpuOptions?.threadsPerCore === 1 ||
    config.cpuOptions?.amdSevSnp === 'enabled' ||
    config.cpuOptions?.nestedVirtualization === 'enabled'
  ) {
    lines.push('');
    lines.push('  cpu_options {');
    if (config.cpuOptions.coreCount) {
      lines.push(`    core_count       = ${config.cpuOptions.coreCount}`);
    }
    if (config.cpuOptions.threadsPerCore !== undefined) {
      lines.push(`    threads_per_core = ${config.cpuOptions.threadsPerCore}`);
    }
    if (config.cpuOptions.amdSevSnp === 'enabled') {
      lines.push(`    amd_sev_snp = "enabled"`);
    }
    if (config.cpuOptions.nestedVirtualization === 'enabled') {
      lines.push(`    nested_virtualization = "enabled"`);
    }
    lines.push('  }');
  }

  // ── Credit specification ──
  if (config.creditSpecification) {
    lines.push('');
    lines.push('  credit_specification {');
    lines.push(`    cpu_credits = "${config.creditSpecification.cpuCredits}"`);
    lines.push('  }');
  }

  // ── Instance market options (spot) ──
  if (config.instanceMarketOptions) {
    lines.push('');
    lines.push('  instance_market_options {');
    lines.push(`    market_type = "${config.instanceMarketOptions.marketType}"`);
    if (config.instanceMarketOptions.spotOptions) {
      const spot = config.instanceMarketOptions.spotOptions;
      lines.push('    spot_options {');
      if (spot.maxPrice) {
        lines.push(`      max_price                    = "${spot.maxPrice}"`);
      }
      lines.push(`      spot_instance_type             = "${spot.spotInstanceType}"`);
      lines.push(
        `      instance_interruption_behavior = "${spot.instanceInterruptionBehavior}"`
      );
      if (spot.validUntil) {
        lines.push(`      valid_until = "${spot.validUntil}"`);
      }
      lines.push('    }');
    }
    lines.push('  }');
  }

  // ── Metadata options ──
  const md = config.metadataOptions;
  if (
    md.httpTokens !== 'required' ||
    md.httpEndpoint !== 'enabled' ||
    md.httpPutResponseHopLimit !== 2 ||
    md.instanceMetadataTags !== 'disabled' ||
    md.httpProtocolIpv6 !== 'disabled'
  ) {
    lines.push('');
    lines.push('  metadata_options {');
    lines.push(`    http_endpoint               = "${md.httpEndpoint}"`);
    lines.push(`    http_tokens                 = "${md.httpTokens}"`);
    lines.push(`    http_put_response_hop_limit = ${md.httpPutResponseHopLimit}`);
    if (md.httpProtocolIpv6 === 'enabled') {
      lines.push(`    http_protocol_ipv6          = "enabled"`);
    }
    if (md.instanceMetadataTags === 'enabled') {
      lines.push(`    instance_metadata_tags = "enabled"`);
    }
    lines.push('  }');
  }

  // ── Capacity reservation ──
  const cr = config.capacityReservationSpecification;
  if (
    cr?.capacityReservationPreference === 'none' ||
    cr?.capacityReservationTarget?.capacityReservationId
  ) {
    lines.push('');
    lines.push('  capacity_reservation_specification {');
    lines.push(
      `    capacity_reservation_preference = "${cr!.capacityReservationPreference}"`
    );
    if (cr?.capacityReservationTarget?.capacityReservationId) {
      lines.push('    capacity_reservation_target {');
      lines.push(
        `      capacity_reservation_id = "${cr.capacityReservationTarget.capacityReservationId}"`
      );
      lines.push('    }');
    }
    lines.push('  }');
  }

  // ── Enclave ──
  if (config.enclaveOptions.enabled) {
    lines.push('');
    lines.push('  enclave_options {');
    lines.push('    enabled = true');
    lines.push('  }');
  }

  // ── Maintenance ──
  if (config.maintenanceOptions.autoRecovery !== 'default') {
    lines.push('');
    lines.push('  maintenance_options {');
    lines.push(`    auto_recovery = "${config.maintenanceOptions.autoRecovery}"`);
    lines.push('  }');
  }

  // ── Private DNS name options ──
  const dns = config.privateDnsNameOptions;
  if (
    dns.hostnameType !== 'ip-name' ||
    dns.enableResourceNameDnsARecord ||
    dns.enableResourceNameDnsAaaaRecord
  ) {
    lines.push('');
    lines.push('  private_dns_name_options {');
    lines.push(`    hostname_type                        = "${dns.hostnameType}"`);
    lines.push(
      `    enable_resource_name_dns_a_record    = ${dns.enableResourceNameDnsARecord}`
    );
    lines.push(
      `    enable_resource_name_dns_aaaa_record = ${dns.enableResourceNameDnsAaaaRecord}`
    );
    lines.push('  }');
  }

  // ── Launch template ──
  const lt = config.launchTemplate;
  if (lt?.id || lt?.name) {
    lines.push('');
    lines.push('  launch_template {');
    if (lt.id) lines.push(`    id = "${lt.id}"`);
    if (lt.name) lines.push(`    name = "${lt.name}"`);
    if (lt.version) lines.push(`    version = "${lt.version}"`);
    lines.push('  }');
  }

  // ── Secondary network interfaces ──
  config.secondaryNetworkInterfaces.forEach((sni) => {
    lines.push('');
    lines.push('  secondary_network_interface {');
    lines.push(`    secondary_subnet_id = "${sni.secondarySubnetId}"`);
    lines.push(`    network_card_index  = ${sni.networkCardIndex}`);
    if (sni.deviceIndex !== undefined) {
      lines.push(`    device_index = ${sni.deviceIndex}`);
    }
    lines.push(`    delete_on_termination = ${sni.deleteOnTermination}`);
    if (sni.privateIpAddressCount) {
      lines.push(`    private_ip_address_count = ${sni.privateIpAddressCount}`);
    }
    lines.push('  }');
  });

  // ── Volume tags ──
  if (Object.keys(config.volumeTags).length > 0) {
    lines.push('');
    lines.push('  volume_tags = {');
    Object.entries(config.volumeTags).forEach(([k, v]) => {
      lines.push(`    ${k} = "${v}"`);
    });
    lines.push('  }');
  }

  // ── Tags ──
  const allTags = { ...config.tags };
  if (config.name) allTags['Name'] = config.name;
  if (Object.keys(allTags).length > 0) {
    lines.push('');
    lines.push('  tags = {');
    Object.entries(allTags).forEach(([k, v]) => {
      lines.push(`    ${k} = "${v}"`);
    });
    lines.push('  }');
  }

  lines.push('}');

  // ── Multiple instances note ──
  if (config.numberOfInstances > 1) {
    lines.push('');
    lines.push(`# Note: ${config.numberOfInstances} instances requested.`);
    lines.push(
      `# Use count = ${config.numberOfInstances} or for_each to create multiple instances.`
    );
  }

  return lines.join('\n');
}

export default StepSummary;
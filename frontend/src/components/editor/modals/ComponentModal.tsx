import { X } from 'lucide-react';
import EC2Modal from './EC2Modal';
import type { EC2Config } from '../../../types/ec2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  node: any;
  onUpdateNode: (nodeId: string, data: any) => void;
}

export default function ComponentModal({ isOpen, onClose, node, onUpdateNode }: Props) {
  if (!isOpen || !node) return null;

  const nodeType = (node.data?.type || '').toLowerCase();

  // EC2 → dedicated modal
  if (nodeType === 'ec2' || nodeType === 'ec2_instance') {
    return (
      <EC2Modal
        isOpen={isOpen}
        onClose={onClose}
        nodeId={node.id}
        initialConfig={node.data?.ec2Config || {}}
        onSave={(config: EC2Config) => {
          onUpdateNode(node.id, {
            ...node.data,
            ec2Config: config,
            label: config.name || node.data?.label || 'EC2 Instance',
            properties: {
              instance_type: config.instanceType,
              ami: config.ami,
              key_name: config.keyPair,
              monitoring: config.advanced.monitoring,
              subnet_id: config.network.subnetId,
              user_data: config.advanced.userData,
              iam_instance_profile: config.advanced.iamInstanceProfile,
              tags: { Name: config.name, ...Object.fromEntries(config.tags.map(t => [t.key, t.value])) },
              root_block_device: {
                volume_size: config.rootVolume.size,
                volume_type: config.rootVolume.volumeType,
                encrypted: config.rootVolume.encrypted,
                delete_on_termination: config.rootVolume.deleteOnTermination,
              },
            },
          });
        }}
      />
    );
  }

  // Generic fallback
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#12121f] border border-gray-700 rounded-2xl p-6 w-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{node.data?.label || 'Component'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          Detailed configuration for this service is coming soon.
        </p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
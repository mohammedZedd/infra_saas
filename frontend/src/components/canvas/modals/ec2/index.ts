// src/components/editor/modals/ec2/index.ts

export { default as EC2Modal } from './EC2Modal';
export { default as EC2ModalSidebar } from './EC2ModalSidebar';
export { default as Step1NameTags } from './steps/Step1NameTags';
export { default as Step2AMI } from './steps/Step2AMI';
export { default as Step3InstanceType } from './steps/Step3InstanceType';
export { default as Step4KeyPair } from './steps/Step4KeyPair';
export { default as Step5Network } from './steps/Step5Network';
export { default as Step6Storage } from './steps/Step6Storage';
export { default as Step7Advanced } from './steps/Step7Advanced';
export { default as StepSummary } from './steps/StepSummary';
export { defaultEC2Config } from './types/ec2-config';
export type { EC2FullConfig } from './types/ec2-config';
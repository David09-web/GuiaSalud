import webpush from 'web-push';

export const VAPID_KEYS = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEe8hyHCXhhaerBwQuzCvD-K8ak2xv0DfyMHnDdy0ap9ahDsajAQ0mRr1AQfx5lVQhhSr6bc4D-uArtuW2AOJ-Q',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'gJ2qIf4mjA9gksza1NSN8ZjtaBOMzW9izG0a278wZXc',
  subject: process.env.VAPID_SUBJECT || 'mailto:soporte@guiasalud.edu.co',
};

webpush.setVapidDetails(
  VAPID_KEYS.subject,
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

export default webpush;


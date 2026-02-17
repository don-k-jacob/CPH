declare module "firebase-admin/app" {
  export type App = any;
  export function cert(value: any): any;
  export function getApps(): any[];
  export function initializeApp(options?: any): any;
}

declare module "firebase-admin/firestore" {
  export const Timestamp: any;
  export function getFirestore(app?: any): any;
}

declare module "firebase-admin/storage" {
  export function getStorage(app?: any): any;
}

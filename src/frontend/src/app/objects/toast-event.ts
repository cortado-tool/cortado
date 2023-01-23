export type ToastEvent = {
  title: string;
  body: string;
  delay: number;
  autoclose: boolean;
  icon: string;
  type: ToastType;
};

export enum ToastType {
  SUCCESS = 0,
  WARNING = 1,
  ERROR = 2,
}

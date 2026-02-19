import { Toast, type ToastShowProps } from "antd-mobile";

const DEFAULT_TOAST_OPTIONS: Pick<ToastShowProps, "duration" | "position"> = {
  duration: 2500,
  position: "bottom",
};

export function showToast(
  content: ToastShowProps["content"],
  options?: Omit<ToastShowProps, "content">
) {
  Toast.show({
    ...DEFAULT_TOAST_OPTIONS,
    ...options,
    content,
  });
}

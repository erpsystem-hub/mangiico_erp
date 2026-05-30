import React from 'react';

type Props = {
  label?: string;
};

/** Spinner khi session Supabase đang khởi tạo — tránh UI treo vô hạn. */
export function SessionInitializingSpinner({ label = 'Đang khởi tạo phiên' }: Props) {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      aria-busy="true"
      aria-label={label}
    >
      <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

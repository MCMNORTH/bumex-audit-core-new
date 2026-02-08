import React from "react";
type FormHeaderProps = {
  title: string;
  subtitle: string;
  logoUrl?: string;
};
export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  logoUrl = "https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png"
}) => {
  return <div className="w-full max-w-md flex flex-col items-center mb-6">
      <img src={logoUrl} alt="Logo" className="w-full max-w-[280px] mb-6" />
      
    </div>;
};
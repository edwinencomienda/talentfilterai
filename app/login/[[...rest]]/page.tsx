import AppLogo from "@/components/app-logo";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="">
        <div className="flex justify-center mb-8">
          <AppLogo logoClassName="w-20 h-auto" />
        </div>
        <SignIn />
      </div>
    </div>
  );
}

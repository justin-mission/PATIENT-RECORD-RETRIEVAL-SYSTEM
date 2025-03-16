import { RegisterForm } from "@/components/auth/register-form";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-primary mb-2">MediTrack</h1>
              <p className="text-gray-500 dark:text-gray-400">Patient Records Management System</p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
import { AlertRuleForm } from "../AlertRuleForm";

export default function AlertRuleFormExample() {
  const handleSubmit = (data: any) => {
    console.log("Rule submitted:", data);
  };

  return (
    <div className="p-6 max-w-2xl">
      <AlertRuleForm onSubmit={handleSubmit} />
    </div>
  );
}

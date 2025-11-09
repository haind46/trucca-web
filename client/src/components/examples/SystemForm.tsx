import { SystemForm } from "../SystemForm";

export default function SystemFormExample() {
  const handleSubmit = (data: any) => {
    console.log("System submitted:", data);
  };

  return (
    <div className="p-6 max-w-2xl">
      <SystemForm onSubmit={handleSubmit} />
    </div>
  );
}

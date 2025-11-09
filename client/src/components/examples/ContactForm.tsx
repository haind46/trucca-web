import { ContactForm } from "../ContactForm";

export default function ContactFormExample() {
  const handleSubmit = (data: any) => {
    console.log("Contact submitted:", data);
  };

  return (
    <div className="p-6 max-w-2xl">
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
}

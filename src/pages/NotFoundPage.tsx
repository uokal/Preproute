import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/components";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-180px)] max-w-[760px] place-items-center text-center">
      <section className="grid gap-4 rounded-[7px] border border-brand-line bg-white p-8 shadow-[0_18px_50px_rgba(47,58,76,0.08)]">
        <p className="m-0 text-base text-[#666]">404</p>
        <h1 className="m-0 text-2xl font-bold">Page not found</h1>
        <p className="text-brand-muted">The page you are looking for may have moved, or the link is no longer available.</p>
        <div className="mt-2.5 flex items-center justify-end gap-5 max-[720px]:flex-col max-[720px]:items-stretch">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button type="button" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard size={16} />
            Back to Dashboard
          </Button>
        </div>
      </section>
    </main>
  );
};

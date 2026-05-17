const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface VerifyRequest {
  procedure_code: string;
  procedure_cost: number;
  insurance_plan_type: "PPO" | "HMO" | "EPO" | "DHMO";
  patient_age: number;
}

export interface VerifyResponse {
  procedure_code: string;
  procedure_cost: number;
  insurance_plan_type: string;
  predicted_coverage_pct: number;
  approval_probability: number;
  risk_factors: string[];
  recommended_action: string;
  estimated_insurance_payment: number;
  estimated_patient_cost: number;
}

export interface CreatePlanRequest {
  calculation_record_id?: number;
  patient_phone?: string;
  total_amount: number;
  months: number;
}

export interface PaymentPlanResponse {
  id: number;
  total_amount: number;
  months: number;
  monthly_payment: number;
  status: string;
  created_at: string;
  installments: {
    id: number;
    installment_number: number;
    amount: number;
    due_date: string;
    paid_at: string | null;
    status: string;
  }[];
}

export async function verifyInsurance(req: VerifyRequest): Promise<VerifyResponse> {
  const res = await fetch(`${BASE}/api/v1/verify-coverage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPaymentPlan(req: CreatePlanRequest): Promise<PaymentPlanResponse> {
  const res = await fetch(`${BASE}/api/v1/payment-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#eaf4f2] text-gray-800 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>

        <p className="mb-6">
          At <strong>ZanPath</strong>, we want you to be satisfied with our digital products. 
          Please review our refund terms below:
        </p>

        <div className="space-y-4">
          <p>
            <strong>Refund Eligibility:</strong> You are entitled to a full refund within <strong>14 days</strong> of your purchase if you are unsatisfied with the product or experience technical issues.
          </p>

          <p>
            <strong>How to Request:</strong> To request a refund, please contact us at <strong>alaricegaye@gmail.com</strong> with your order details and transaction ID.
          </p>

          <p>
            <strong>Processing:</strong> Once approved, refunds will be processed back to your original payment method via Paddle. 
          </p>
          
          <p className="text-sm text-gray-600 italic">
            Please note that after 14 days of purchase, all sales are considered final.
          </p>
        </div>
      </div>
    </div>
  );
}
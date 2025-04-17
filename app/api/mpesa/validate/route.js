export async function POST(req) {
    try {
      const body = await req.json();
  
      // You could add validation logic here if needed
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Validated" }), {
        status: 200,
      });
    } catch (error) {
      console.error("Validation error:", error);
      return new Response(JSON.stringify({ ResultCode: 1, ResultDesc: "Rejected" }), {
        status: 500,
      });
    }
  }
  
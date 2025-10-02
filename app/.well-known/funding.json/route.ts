export async function GET() {
  return Response.json({
  opRetro: {
    projectId: process.env.OP_PROJECT_ID,
  }
});
}
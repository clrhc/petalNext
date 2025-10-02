export async function GET() {
const id = process.env.OP_PROJECT_ID as string;
return Response.json({opRetro: {
      projectId: id,
    },
});}
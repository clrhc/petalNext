function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const id = process.env.OP_PROJECT_ID as String;
return Response.json({opRetro: {
      projectId: id,
    },
});}
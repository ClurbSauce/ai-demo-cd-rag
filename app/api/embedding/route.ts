import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
    const { title, generalDescription, detailDescription } = await req.json();
    const text = `Title: ${title}\nGeneral Description: ${generalDescription}\nDetailed Description: ${detailDescription}`;
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `${text}`,
        encoding_format: "float",
    });
    console.log(embedding.data[0].embedding);
    return new Response(JSON.stringify(
        {embeddingText: embedding.data[0].embedding}
    ))
}
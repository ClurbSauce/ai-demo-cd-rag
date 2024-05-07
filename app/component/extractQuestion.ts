export default function extractQuestion(messages: any[]): string {
    return messages
        .filter(message => message.role === 'user')
        .map(message => message.content)
        .join(" "); // Combines all user messages into a single string if multiple.
}

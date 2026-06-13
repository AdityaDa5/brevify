import { calculateCosineSimilarity, calculateTextRankScores, calculateTfIdf, smoothSimilarityMatrix } from "./compute.js";
import { sentTokenizer } from "./tokenizer.js";

export function generateSummary(docs, topN=5) {

    const summary = [];

    const tfIdfMatrix = calculateTfIdf(docs, true);

    const similarityMatrix = smoothSimilarityMatrix(calculateCosineSimilarity(tfIdfMatrix), 0.15);

    const textRanked = calculateTextRankScores(similarityMatrix);

    // Rebuild sentence array from the scores
    const sentences = sentTokenizer(docs, false);
    let topNPercentage = Math.ceil((topN/100) * sentences.length);

    if (topNPercentage <= 1) {
        topNPercentage = Math.min(3, sentences.length);
    }

    textRanked.slice(0, topNPercentage).sort((a, b) => a.index - b.index).forEach(rank => {
        summary.push(sentences[rank.index]);
    });

    return summary;

}
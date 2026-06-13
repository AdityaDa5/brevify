import { sentTokenizer } from "./tokenizer.js";

export function calculateTfIdf(docs, returnAsMatrix=false) {
    const sentences = sentTokenizer(docs, true);

    const totalDocuments = sentences.length;

    const df = {};

    sentences.forEach(sentence => {
        const uniqueWords = new Set(sentence.toLowerCase().split(/\s+/));
        uniqueWords.forEach(word => {
            df[word] = (df[word] || 0) + 1;
        });   
    });

    const tfidfscores = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        const tf = {};
        words.forEach(word => {
            tf[word] = (tf[word] || 0) + 1;
        });
        const totalWords = words.length;
        Object.keys(tf).forEach(word => {
            tf[word] /= totalWords;
        });
        const tfidf = {};
        Object.keys(tf).forEach(word => {
            const idf = Math.log(totalDocuments/(df[word] || 1));
            tfidf[word] = tf[word] * idf;
        });

        return {
            sentence,
            tfidf
        }

    });

    if (!returnAsMatrix) {
        return tfidfscores
    } else {
        // Returns Sparse Matrix
        // const tfidfMatrix = [];
        // tfidfscores.forEach(sentence => {
        //     const sentenceScore = [];
        //     Object.keys(sentence.tfidf).forEach(word => {
        //         sentenceScore.push(sentence.tfidf[word]);
        //     });
        //     tfidfMatrix.push(sentenceScore);
        // });

        // return tfidfMatrix;

        // Returns dense matrix
        const vocabulary = new Set();
        tfidfscores.forEach(sentence => {
            Object.keys(sentence.tfidf).forEach(word => {
                vocabulary.add(word);
            });
        })

        const vocabList = Array.from(vocabulary);

        const tfidfMatrix = tfidfscores.map(sentence => {
            return vocabList.map(word => sentence.tfidf[word] || 0);
        });

        return tfidfMatrix;

    }

}

export function calculateCosineSimilarity(tfidfMatrix) {
    const n = tfidfMatrix.length;

    const similarityMatrix = Array.from({length: n}, () => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for(let j = i; j < n; j++) {

            const vec1 = tfidfMatrix[i];
            const vec2 = tfidfMatrix[j];

            let dot = 0;
            let norm1 = 0;
            let norm2 = 0;

            for (let k = 0; k < vec1.length; k++) {
                dot += vec1[k] * vec2[k];
                norm1 += vec1[k] * vec1[k];
                norm2 += vec2[k] * vec2[k];
            }
            
            const similarity = (norm1 === 0 || norm2 === 0) ? 0 : dot / (Math.sqrt(norm1) * Math.sqrt(norm2));

            similarityMatrix[i][j] = similarity;
            similarityMatrix[j][i] = similarity;

        }
    }

    return similarityMatrix;
}

export function smoothSimilarityMatrix(similarityMatrix, factor = 0.15) {
    const n = similarityMatrix.length;

    const uniformValue = 1 / n;

    return similarityMatrix.map(row => 
        row.map(value => (1 - factor) * value + factor * uniformValue)
    );
}

export function calculateTextRankScores(similarityMatrix, dampingFactor=0.85, maxIterations=100, tolerance=1e-8) {
    const n = similarityMatrix.length;

    let scores = Array(n).fill(1/n); // Eigenvector

    for (let iter = 0; iter < maxIterations; iter++) {
        const newScores = Array(n).fill((1 - dampingFactor)/n);

        for(let i = 0; i < n; i++) {
            const rowSum = similarityMatrix[i].reduce((a,b) => a+b, 0);

            if (rowSum === 0) {
                continue; // Skip this iteration instead of returning
            }
            
            for (let j = 0; j < n; j++) {
                newScores[j] += dampingFactor * (similarityMatrix[i][j] / rowSum) * scores[i];
            }
        }

        let diff = 0;

        for(let i = 0; i < n; i++) {
            diff += Math.abs(newScores[i] - scores[i]);
        }

        scores = newScores;

        if (diff < tolerance) {
            break;
        }

    }

    return scores.map((score, index) => ({
        index,
        score
    })).sort((a, b) => b.score - a.score);

}
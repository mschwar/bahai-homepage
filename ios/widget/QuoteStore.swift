import Foundation

struct DailyQuote: Decodable {
    let text: String
    let author: String?
    let source: String?
}

enum QuoteStore {
    static let maxWords = 75

    static func loadQuotes() -> [DailyQuote] {
        guard let url = Bundle.main.url(forResource: "quotes_hidden_words", withExtension: "json") else {
            return []
        }

        do {
            let data = try Data(contentsOf: url)
            let decoded = try JSONDecoder().decode([DailyQuote].self, from: data)
            return decoded.filter { countWords($0.text) <= maxWords }
        } catch {
            return []
        }
    }

    static func quote(for date: Date, in quotes: [DailyQuote]) -> DailyQuote? {
        guard !quotes.isEmpty else { return nil }
        let dayIndex = dayOfYear(date)
        let index = dayIndex % quotes.count
        return quotes[index]
    }

    private static func dayOfYear(_ date: Date) -> Int {
        let calendar = Calendar.current
        if let ordinal = calendar.ordinality(of: .day, in: .year, for: date) {
            return max(ordinal - 1, 0)
        }
        return 0
    }

    private static func countWords(_ text: String) -> Int {
        return text.split { $0 == " " || $0 == "\n" || $0 == "\t" }.count
    }
}

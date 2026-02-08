import WidgetKit
import SwiftUI

struct DailyVerseEntry: TimelineEntry {
    let date: Date
    let quote: DailyQuote
}

struct DailyVerseProvider: TimelineProvider {
    func placeholder(in context: Context) -> DailyVerseEntry {
        DailyVerseEntry(date: Date(), quote: DailyQuote(text: "O SON OF SPIRIT!", author: "Bahá’u’lláh", source: "The Hidden Words"))
    }

    func getSnapshot(in context: Context, completion: @escaping (DailyVerseEntry) -> Void) {
        let entry = makeEntry(for: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DailyVerseEntry>) -> Void) {
        let now = Date()
        let entry = makeEntry(for: now)
        let refresh = nextMidnight(after: now)
        let timeline = Timeline(entries: [entry], policy: .after(refresh))
        completion(timeline)
    }

    private func makeEntry(for date: Date) -> DailyVerseEntry {
        let quotes = QuoteStore.loadQuotes()
        if let quote = QuoteStore.quote(for: date, in: quotes) {
            return DailyVerseEntry(date: date, quote: quote)
        }
        return DailyVerseEntry(date: date, quote: DailyQuote(text: "Daily verse unavailable.", author: nil, source: nil))
    }

    private func nextMidnight(after date: Date) -> Date {
        let calendar = Calendar.current
        if let next = calendar.nextDate(after: date, matching: DateComponents(hour: 0, minute: 0, second: 5), matchingPolicy: .nextTime) {
            return next
        }
        return calendar.startOfDay(for: date.addingTimeInterval(86400))
    }
}

struct DailyVerseWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: DailyVerseProvider.Entry

    var body: some View {
        switch family {
        case .accessoryInline:
            Text(entry.quote.text)
                .font(.system(size: 12, weight: .light, design: .serif))
                .lineLimit(1)
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.quote.text)
                    .font(.system(size: 13, weight: .light, design: .serif))
                    .lineLimit(3)
                Text(entry.quote.author ?? "Bahá’u’lláh")
                    .font(.system(size: 11, weight: .regular, design: .default))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        case .systemSmall:
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.quote.text)
                    .font(.system(size: 14, weight: .light, design: .serif))
                    .lineLimit(5)
                Text(entry.quote.author ?? "Bahá’u’lláh")
                    .font(.system(size: 12, weight: .regular, design: .default))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        default:
            Text(entry.quote.text)
                .font(.system(size: 12, weight: .light, design: .serif))
                .lineLimit(3)
        }
    }
}

@main
struct DailyVerseWidget: Widget {
    let kind: String = "DailyVerseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DailyVerseProvider()) { entry in
            DailyVerseWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Lodestone")
        .description("A daily quote from The Hidden Words.")
        .supportedFamilies([.accessoryInline, .accessoryRectangular, .systemSmall])
    }
}

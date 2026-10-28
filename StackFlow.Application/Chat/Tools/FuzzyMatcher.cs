namespace StackFlow.Application.Chat.Tools;

/// <summary>
/// Typo-tolerant matching for employee and department names. Handles misspellings ("arnv"),
/// word prefixes ("tech" for "Technical") and multi-word queries. Pure: no I/O.
/// </summary>
public static class FuzzyMatcher
{
    private const double MinimumScore = 0.75;
    private const double PrefixScore = 0.9;
    private const int MinimumPrefixLength = 3;

    // Filler words people say around a name ("technical team", "dept"). Ignored when matching.
    private static readonly HashSet<string> FillerWords = ["the", "of", "team", "department", "dept", "group"];

    /// <summary>Returns candidates whose best key matches the query, best match first.</summary>
    public static IReadOnlyList<(T Item, double Score)> Rank<T>(
        string query, IEnumerable<T> candidates, Func<T, IEnumerable<string>> keysOf)
    {
        var normalizedQuery = Normalize(query);
        if (normalizedQuery.Length == 0)
        {
            return [];
        }

        return candidates
            .Select(candidate => (Item: candidate, Score: keysOf(candidate)
                .Select(key => Score(normalizedQuery, Normalize(key)))
                .DefaultIfEmpty(0)
                .Max()))
            .Where(match => match.Score >= MinimumScore)
            .OrderByDescending(match => match.Score)
            .ToList();
    }

    private static double Score(string query, string key)
    {
        if (key.Length == 0)
        {
            return 0;
        }

        if (query == key)
        {
            return 1;
        }

        // Every query word should match some word in the key; average the per-word scores so
        // "arnav sharma" against "Arnav Kumar" scores lower than against "Arnav Sharma".
        var keyWords = key.Split(' ');
        var queryWords = query.Split(' ');
        return queryWords.Average(queryWord => keyWords.Max(keyWord => WordScore(queryWord, keyWord)));
    }

    private static double WordScore(string queryWord, string keyWord)
    {
        if (queryWord == keyWord)
        {
            return 1;
        }

        if (queryWord.Length >= MinimumPrefixLength && keyWord.StartsWith(queryWord, StringComparison.Ordinal))
        {
            return PrefixScore;
        }

        var longest = Math.Max(queryWord.Length, keyWord.Length);
        return 1.0 - (double)DamerauDistance(queryWord, keyWord) / longest;
    }

    private static string Normalize(string value)
    {
        var letters = new string(value.ToLowerInvariant()
            .Select(character => char.IsLetterOrDigit(character) ? character : ' ')
            .ToArray());
        var words = letters.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(word => !FillerWords.Contains(word));
        return string.Join(' ', words);
    }

    /// <summary>Edit distance where a swapped pair of adjacent letters counts as one edit ("priya" vs "pirya").</summary>
    private static int DamerauDistance(string source, string target)
    {
        var rows = source.Length + 1;
        var columns = target.Length + 1;
        var distance = new int[rows, columns];

        for (var row = 0; row < rows; row++) distance[row, 0] = row;
        for (var column = 0; column < columns; column++) distance[0, column] = column;

        for (var row = 1; row < rows; row++)
        {
            for (var column = 1; column < columns; column++)
            {
                var cost = source[row - 1] == target[column - 1] ? 0 : 1;
                distance[row, column] = Math.Min(
                    Math.Min(distance[row - 1, column] + 1, distance[row, column - 1] + 1),
                    distance[row - 1, column - 1] + cost);

                if (row > 1 && column > 1 &&
                    source[row - 1] == target[column - 2] && source[row - 2] == target[column - 1])
                {
                    distance[row, column] = Math.Min(distance[row, column], distance[row - 2, column - 2] + 1);
                }
            }
        }

        return distance[rows - 1, columns - 1];
    }
}

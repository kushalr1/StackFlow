using stackflow_api.Services;
namespace StackFlow.Application.Chat;

/// <summary>
/// Per-request sink for UI actions and follow-up chips that tools produce while answering.
/// Scoped to one chat request, so nothing leaks between users or messages.
/// </summary>
public class ChatActionCollector
{
    private const int MaxSuggestions = 6;
    private readonly List<ChatAction> _actions = [];
    private readonly List<string> _suggestions = [];
    private readonly List<ChatList> _lists = [];

    public IReadOnlyList<ChatAction> Actions => _actions;
    public IReadOnlyList<string> Suggestions => _suggestions;
    public IReadOnlyList<ChatList> Lists => _lists;

    public void AddList(ChatList list) => _lists.Add(list);

    public void AddAction(ChatAction action)
    {
        if (!_actions.Contains(action))
        {
            _actions.Add(action);
        }
    }

    public void SetSuggestions(IEnumerable<string> options)
    {
        _suggestions.Clear();
        _suggestions.AddRange(options
            .Select(option => option.Trim())
            .Where(option => option.Length is > 0 and <= 40)
            .Distinct()
            .Take(MaxSuggestions));
    }

    public void Clear()
    {
        _actions.Clear();
        _suggestions.Clear();
        _lists.Clear();
    }
}

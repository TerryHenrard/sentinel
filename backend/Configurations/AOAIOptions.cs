namespace backend.Configurations
{
    public class AOAIOptions
    {
        public required string DepName { get; init; }
        public required string ApiEndpoint { get; init; }
        public required string ApiKey { get; init; }

        public AOAIOptions() { }

        public AOAIOptions(string depName, string apiEndpoint, string apiKey)
        {
            DepName = depName ?? throw new ArgumentNullException(nameof(depName));
            ApiEndpoint = apiEndpoint ?? throw new ArgumentNullException(nameof(apiEndpoint));
            ApiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        }
    }
}
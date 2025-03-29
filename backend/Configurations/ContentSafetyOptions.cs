namespace backend.Configurations
{
    public class ContentSafetyOptions
    {
        public required string ApiEndpoint { get; init; }
        public required string ApiKey { get; init; }

        public ContentSafetyOptions() { }

        public ContentSafetyOptions(string apiEndpoint, string apiKey)
        {
            ApiEndpoint = apiEndpoint ?? throw new ArgumentNullException(nameof(apiEndpoint));
            ApiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        }
    }
}
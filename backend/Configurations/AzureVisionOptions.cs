namespace backend.Configurations
{
    public class AzureVisionOptions
    {
        public required string ApiEndpoint { get; init; }
        public required string ApiKey { get; init; }

        public AzureVisionOptions() { }

        public AzureVisionOptions(string apiEndpoint, string apiKey)
        {
            ApiEndpoint = apiEndpoint ?? throw new ArgumentNullException(nameof(apiEndpoint));
            ApiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        }
    }
}
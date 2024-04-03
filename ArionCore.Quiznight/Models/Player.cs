using Newtonsoft.Json;

namespace ArionCore.Quiznight.Models
{
    public class Player
    {
        #region Properties

        [JsonProperty("session_id")]
        public string SessionId { get; set; }

        [JsonProperty("username")]
        public string Username { get; set; }

        [JsonProperty("score")]
        public int Score { get; set; }

        [JsonProperty("correct")]
        public int CorrectAnswers { get; set; }

        [JsonProperty("wrong")]
        public int WrongAnswers { get; set; }

        [JsonProperty("is_connected")]
        public bool IsConnected { get; set; }

        [JsonProperty("has_buzzed")]
        public bool HasBuzzed { get; set; }

        [JsonProperty("current_answer")]
        public string CurrentAnswer { get; set; }

        #endregion

        #region Constructor

        public Player(){}

        public Player(string username, string sessionId, bool isConnected = true)
        {
            Username = username;
            SessionId = sessionId;
            IsConnected = isConnected;

        }

        #endregion
    }
}

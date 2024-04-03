using Newtonsoft.Json;

namespace ArionCore.Quiznight.Models
{
    public class Room
    {
        #region Properties

        [JsonProperty("code")]
        public string Code { get; set; }

        [JsonProperty("moderator")]
        public Player Moderator { get; set; }

        [JsonProperty("players")]
        public List<Player> Players { get; set; } = new List<Player>();

        [JsonProperty("is_buzzer_open")]
        public bool IsBuzzerOpen { get; set; } = true;

        [JsonProperty("current_question")]
        public string CurrentQuestion { get; set; }

        [JsonProperty("points_correct_answer")]
        public int PointsCorrectAnswer { get; set; } = 3;

        [JsonProperty("points_wrong_answer")]
        public int PointsWrongAnswer { get; set; } = 1;

        #endregion

        #region Constructor

        public Room(){}

        public Room(string code)
        {
            Code = code;
        }

        #endregion

        #region Methods

        public Player GetPlayerBySessionId(string sessionId)
        {
            return Players.FirstOrDefault(p => p.SessionId == sessionId);
        }

        #endregion
    }
}

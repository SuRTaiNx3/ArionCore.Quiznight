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

        private List<Player> _players = new List<Player>();
        [JsonProperty("players")]
        public List<Player> Players 
        {
            get 
            {
                if (_players == null) _players = new List<Player>();
                return _players;
            }
            set 
            { 
                _players = value; 
            } 
        }

        [JsonProperty("is_buzzer_open")]
        public bool IsBuzzerOpen { get; set; } = true;

        [JsonProperty("points_correct_answer")]
        public int PointsCorrectAnswer { get; set; } = 3;

        [JsonProperty("points_wrong_answer")]
        public int PointsWrongAnswer { get; set; } = 1;

        [JsonProperty("image_as_base64")]
        public string CurrentImageAsBsae64 { get; set; }

        [JsonProperty("is_image_visible")]
        public bool IsImageVisible { get; set; } = false;

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

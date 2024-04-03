using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class ModifyPlayerScoreRequest : RequestMessageBase
    {
        public string session_id;

        public int score;

        public ModifyPlayerScoreRequest(string nsessionId, int nscore) : base(EMessageType.PlayerBuzzerRequest) { session_id = nsessionId; score = nscore; }
    }
}

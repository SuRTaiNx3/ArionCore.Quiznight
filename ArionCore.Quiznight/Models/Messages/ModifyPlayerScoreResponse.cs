using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class ModifyPlayerScoreResponse : ResponseMessageBase
    {
        public string related_session_id;

        public int score;

        public ModifyPlayerScoreResponse(string relatedSessionId, int nscore) : base(EMessageType.ModifyPlayerScoreResponse)
        {
            related_session_id = relatedSessionId;
            score = nscore;
        }
    }
}

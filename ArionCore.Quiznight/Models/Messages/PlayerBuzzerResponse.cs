using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class PlayerBuzzerResponse : ResponseMessageBase
    {
        public string winner_session_id;

        public PlayerBuzzerResponse(string winnerSessionId) : base(EMessageType.PlayerBuzzerResponse)
        {
            winner_session_id = winnerSessionId;
        }
    }
}

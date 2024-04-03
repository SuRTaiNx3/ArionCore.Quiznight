using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class ConfirmAnswerRequest : RequestMessageBase
    {
        public string player_session_id;

        public bool was_correct;

        public ConfirmAnswerRequest() : base(EMessageType.ConfirmAnswerRequest) { }
    }
}

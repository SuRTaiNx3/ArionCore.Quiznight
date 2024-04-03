using ArionCore.Quiznight.Enums;

namespace ArionCore.Quiznight.Models.Messages
{
    public class UpdatePointsSettingsRequest : RequestMessageBase
    {
        public int points_correct;

        public int points_wrong;

        public UpdatePointsSettingsRequest(int pointsCorrect, int pointsWrong) : base(EMessageType.UpdatePointsSettingsRequest) 
        { 
            points_correct = pointsCorrect; 
            points_wrong = pointsWrong;
        }
    }
}

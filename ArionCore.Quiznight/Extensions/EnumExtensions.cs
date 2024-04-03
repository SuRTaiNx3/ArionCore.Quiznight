namespace ArionCore.Quiznight.Extensions
{
    public static class EnumExtensions
    {
        public static TEnum ToEnum<TEnum>(this string strEnumValue, TEnum defaultValue)
        {
            if (!Enum.IsDefined(typeof(TEnum), strEnumValue))
                return defaultValue;

            return (TEnum)Enum.Parse(typeof(TEnum), strEnumValue);
        }

        public static TEnum ToEnum<TEnum>(this int intEnumValue, TEnum defaultValue)
        {
            if (!Enum.IsDefined(typeof(TEnum), intEnumValue))
                return defaultValue;

            return (TEnum)Enum.ToObject(typeof(TEnum), intEnumValue);
        }
    }
}

package entities

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
)

// StringArray is a custom type to handle PostgreSQL string arrays
type StringArray []string

// Value implements the driver.Valuer interface
func (sa StringArray) Value() (driver.Value, error) {
	if sa == nil {
		return nil, nil
	}
	if len(sa) == 0 {
		return "{}", nil
	}

	escaped := make([]string, len(sa))
	for i, s := range sa {
		if strings.ContainsAny(s, " ,{}") || strings.Contains(s, "'") {
			escaped[i] = "\"" + strings.ReplaceAll(s, "\"", "\\\"") + "\""
		} else {
			escaped[i] = s
		}
	}
	return "{" + strings.Join(escaped, ",") + "}", nil
}

// Scan implements the sql.Scanner interface
func (sa *StringArray) Scan(value interface{}) error {
	if value == nil {
		*sa = nil
		return nil
	}

	switch v := value.(type) {
	case []byte:
		// Handle PostgreSQL array format: {item1,item2,item3}
		if len(v) == 0 {
			*sa = StringArray{}
			return nil
		}

		// Remove curly braces
		str := string(v)
		if len(str) < 2 {
			*sa = StringArray{}
			return nil
		}

		str = strings.Trim(str, "{}")
		if str == "" {
			*sa = StringArray{}
			return nil
		}

		// Split by comma and unquote
		parts := strings.Split(str, ",")
		result := make([]string, len(parts))
		for i, part := range parts {
			part = strings.TrimSpace(part)
			// Remove quotes if present (both single and double quotes, including multiple quotes)
			for len(part) >= 2 {
				if (part[0] == '"' && part[len(part)-1] == '"') ||
					(part[0] == '\'' && part[len(part)-1] == '\'') {
					part = part[1 : len(part)-1]
					// Unescape quotes
					if part[0] == '"' && part[len(part)-1] == '"' {
						part = strings.ReplaceAll(part, "\\\"", "\"")
					}
				} else {
					break
				}
			}
			result[i] = part
		}
		*sa = StringArray(result)

	case string:
		// Handle string representation
		if v == "" {
			*sa = StringArray{}
			return nil
		}
		return sa.Scan([]byte(v))

	default:
		return fmt.Errorf("cannot scan %T into StringArray", value)
	}

	return nil
}

// MarshalJSON implements json.Marshaler
func (sa StringArray) MarshalJSON() ([]byte, error) {
	return json.Marshal([]string(sa))
}

// UnmarshalJSON implements json.Unmarshaler
func (sa *StringArray) UnmarshalJSON(data []byte) error {
	var arr []string
	if err := json.Unmarshal(data, &arr); err != nil {
		return err
	}
	*sa = StringArray(arr)
	return nil
}

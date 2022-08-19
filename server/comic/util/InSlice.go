package util

func InSlice(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func RemoveIndex[E any](s []E, index int) []E {
	return append(s[:index], s[index+1:]...)
}

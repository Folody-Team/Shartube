package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/99designs/gqlgen/api"
	"github.com/99designs/gqlgen/codegen/config"
	"github.com/99designs/gqlgen/plugin/modelgen"
	"github.com/vektah/gqlparser/v2/ast"
	"golang.org/x/exp/slices"
)

func mutateHook(b *modelgen.ModelBuild) *modelgen.ModelBuild {

	for _, model := range b.Models {
		for i, field := range model.Fields {
			if field.Name == "_id" {
				field.Tag += ` bson:"` + field.Name + `"`
			}
			if strings.Contains(field.Description, `inherit:"`) && i == 0 {
				inheritModelIndex := slices.IndexFunc(b.Models, func(o *modelgen.Object) bool {
					return o.Name == strings.TrimSpace(strings.Replace(strings.Replace(field.Description, "inherit:", "", -1), `"`, "", -1))
				})
				for _, inheritField := range b.Models[inheritModelIndex].Fields {
					isOverwriteField := slices.IndexFunc(model.Fields, func(o *modelgen.Field) bool {
						return o.Name == inheritField.Name
					})
					if isOverwriteField == -1 {
						model.Fields = append(model.Fields, inheritField)
					}
				}
			}

		}
	}
	return b
}
func fieldHook(td *ast.Definition, fd *ast.FieldDefinition, f *modelgen.Field) (*modelgen.Field, error) {
	inheritsDirectives := td.Directives.ForName("inherits")
	if inheritsDirectives != nil {
		var a map[string]interface{}
		inheritTypeName := inheritsDirectives.ArgumentMap(a)["type"]
		f.Description += ` inherit:"` + inheritTypeName.(string) + `"`
	}
	return f, nil
}
func main() {
	cfg, err := config.LoadConfigFromDefaultLocations()
	if err != nil {
		l := log.New(os.Stderr, "", 0)
		l.Println("failed to load config", err.Error())
		os.Exit(2)
	}

	// Attaching the mutation function onto modelgen plugin
	p := modelgen.Plugin{
		MutateHook: mutateHook,
		FieldHook:  fieldHook,
	}

	err = api.Generate(cfg, api.ReplacePlugin(&p))

	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(3)
	}
}

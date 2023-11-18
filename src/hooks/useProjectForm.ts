import { urlRegex } from "@/constants";
import { useForm } from "@mantine/form";
import { useEffect } from "react";

// https://developers.google.com/search/docs/crawling-indexing/special-tags
// https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives
// https://gist.github.com/whitingx/3840905
const useProjectForm = (project?: any) => {
  const form = useForm({
    initialValues: {
      name: '',
      // description: '',
      target_audience: '',
      website: '',
    },
    validate: {
      name: (value) => !value || value.trim().length > 50 ? 'Please enter a name with 50 characters or less' : null,
      // description: (value) => !value || value.trim().length > 500 ? 'Please enter a name with 500 characters or less' : null,
      target_audience: (value) => !value || value.trim().length > 150 ? 'Please enter a name with 150 characters or less' : null,
      website: (value) => !urlRegex.test(value) ? 'Please enter a valid url' : null,
    },
    transformValues: (values) => ({
      ...values,
      website: new URL(values.website).origin
    })
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        name: project.name,
        target_audience: project.target_audience,
        website: project.website,
      })
    }
  }, [project])

  return form
}

export default useProjectForm
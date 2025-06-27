import { useState } from 'react';

export interface UseFormOptions {
  onSubmit: (data: Record<string, string>) => Promise<void>;
  validate?: (data: Record<string, string>) => Record<string, string>;
}

export const useForm = (
  initialValues: Record<string, string>,
  options: UseFormOptions
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    if (!options.validate) return true;
    
    const newErrors = options.validate(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await options.onSubmit(values);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    updateValue,
    handleSubmit,
    resetForm,
    isSubmitting,
  };
};

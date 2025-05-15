"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useTranslations } from 'next-intl';

// Form schema validation
const formSchema = z.object({
  prompt: z.string().min(3, { message: "Prompt must be at least 3 characters" }),
  aspect_ratio: z.string().default("1:1"),
  num_outputs: z.number().min(1).max(4).default(1),
  num_inference_steps: z.number().min(1).max(4).default(4),
  seed: z.number().optional(),
  useSeed: z.boolean().default(false),
  output_format: z.enum(["png", "jpg", "webp"]).default("webp"),
  output_quality: z.number().min(1).max(100).default(80),
  megapixels: z.string().default("1"),
});

export type GeneratorFormValues = z.infer<typeof formSchema>;

export interface GeneratorFormProps {
  onGenerate: (values: GeneratorFormValues) => void;
  isGenerating: boolean;
  isDisabled?: boolean;
}

export const GeneratorForm = ({ onGenerate, isGenerating, isDisabled = false }: GeneratorFormProps) => {
  const [randomSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const t = useTranslations();

  // Form initialization with default values
  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      aspect_ratio: "1:1",
      num_outputs: 1,
      num_inference_steps: 4,
      seed: randomSeed,
      useSeed: false,
      output_format: "webp",
      output_quality: 80,
      megapixels: "1",
    },
  });

  const generateRandomSeed = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    form.setValue("seed", newSeed);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-xl border border-border p-6 shadow-sm"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
          {/* Prompt */}
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.prompt.label')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('generator.form.prompt.placeholder')}
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('generator.form.prompt.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aspect Ratio */}
          <FormField
            control={form.control}
            name="aspect_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.aspectRatio.label')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('generator.form.aspectRatio.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1:1">{t('generator.form.aspectRatio.options.square')}</SelectItem>
                    <SelectItem value="16:9">{t('generator.form.aspectRatio.options.landscape')}</SelectItem>
                    <SelectItem value="9:16">{t('generator.form.aspectRatio.options.portrait')}</SelectItem>
                    <SelectItem value="4:3">{t('generator.form.aspectRatio.options.standard')}</SelectItem>
                    <SelectItem value="3:2">{t('generator.form.aspectRatio.options.photo')}</SelectItem>
                    <SelectItem value="2:1">{t('generator.form.aspectRatio.options.panorama')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('generator.form.aspectRatio.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Number of Outputs */}
          <FormField
            control={form.control}
            name="num_outputs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.numOutputs.label', { value: field.value })}</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  {t('generator.form.numOutputs.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inference Steps */}
          <FormField
            control={form.control}
            name="num_inference_steps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.steps.label', { value: field.value })}</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={1}
                    max={4}
                    step={1}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  {t('generator.form.steps.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Random Seed */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="useSeed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t('generator.form.useSeed.label')}</FormLabel>
                    <FormDescription>
                      {t('generator.form.useSeed.description')}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("useSeed") && (
              <FormField
                control={form.control}
                name="seed"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>{t('generator.form.seed.label')}</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateRandomSeed}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        {t('generator.form.seed.random')}
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('generator.form.seed.description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Output Format */}
          <FormField
            control={form.control}
            name="output_format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.outputFormat.label')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="png" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">PNG</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="jpg" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">JPG</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="webp" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">WebP</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Output Quality */}
          <FormField
            control={form.control}
            name="output_quality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.outputQuality.label', { value: field.value })}</FormLabel>
                <FormControl>
                  <Slider
                    defaultValue={[field.value]}
                    min={10}
                    max={100}
                    step={10}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormDescription>
                  {t('generator.form.outputQuality.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Megapixels */}
          <FormField
            control={form.control}
            name="megapixels"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generator.form.megapixels.label')}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('generator.form.megapixels.placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0.5">{t('generator.form.megapixels.options.low')}</SelectItem>
                    <SelectItem value="1">{t('generator.form.megapixels.options.standard')}</SelectItem>
                    <SelectItem value="2">{t('generator.form.megapixels.options.high')}</SelectItem>
                    <SelectItem value="4">{t('generator.form.megapixels.options.ultra')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('generator.form.megapixels.description')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Generate Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isGenerating || isDisabled}
          >
            {isGenerating ? (
              <>
                <LoadingSpinner className="mr-2" size="sm" />
                {t('generator.form.generateButton.generating')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('generator.form.generateButton.default')}
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};
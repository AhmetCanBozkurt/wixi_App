import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLanguage } from '../../contexts/language-context';
import corporateContactService from '../../ApiServices/services/CorporateContactService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const contactFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  specialist: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactForm = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await corporateContactService.submitContactForm({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        subject: data.specialist || 'Consultation Request',
        message: `Date: ${data.date || 'N/A'}, Time: ${data.time || 'N/A'}`,
      });
      if (result.success) {
        toast.success(result.message || 'Appointment request sent successfully!');
        reset();
      } else {
        toast.error(result.error || 'Error sending appointment request');
      }
    } catch (error) {
      toast.error('Error sending appointment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="dark:bg-darkmode md:pb-24 pb-16" id="form">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
          <div className="col-span-6">
            <h2 className="max-w-72 text-[40px] leading-tight font-bold mb-9 text-midnight_text dark:text-white">
              {t('contact.form.title') || 'Get Online Consultation'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap w-full m-auto justify-between">
              <div className="sm:flex gap-3 w-full">
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="first-name"
                    className="pb-3 inline-block text-base text-midnight_text dark:text-white"
                  >
                    {t('contact.form.firstName') || 'First Name'}*
                  </label>
                  <input
                    id="first-name"
                    {...register('firstName')}
                    className="w-full text-base px-4 rounded-lg py-2.5 border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0"
                    type="text"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="last-name"
                    className="pb-3 inline-block text-base text-midnight_text dark:text-white"
                  >
                    {t('contact.form.lastName') || 'Last Name'}*
                  </label>
                  <input
                    id="last-name"
                    {...register('lastName')}
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0"
                    type="text"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="sm:flex gap-3 w-full">
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="email"
                    className="pb-3 inline-block text-base text-midnight_text dark:text-white"
                  >
                    {t('contact.form.email') || 'Email address'}*
                  </label>
                  <input
                    id="email"
                    {...register('email')}
                    type="email"
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:border-dark_border border-solid dark:text-white dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary focus:border-solid focus:outline-0"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="specialist"
                    className="pb-3 inline-block text-base text-midnight_text dark:text-white"
                  >
                    {t('contact.form.specialist') || 'Specialist'}*
                  </label>
                  <select
                    id="specialist"
                    {...register('specialist')}
                    className="w-full text-base px-4 py-2.5 rounded-lg border-border dark:text-white border-solid dark:bg-darkmode border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0"
                  >
                    <option value="">{t('contact.form.chooseSpecialist') || 'Choose a specialist'}</option>
                    <option value="Software Development">{t('contact.form.softwareDev') || 'Software Development'}</option>
                    <option value="SaaS Solutions">{t('contact.form.saas') || 'SaaS Solutions'}</option>
                    <option value="Consulting">{t('contact.form.consulting') || 'Consulting'}</option>
                    <option value="Support">{t('contact.form.support') || 'Support & Maintenance'}</option>
                  </select>
                </div>
              </div>
              <div className="sm:flex gap-3 w-full">
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="date"
                    className="pb-3 inline-block text-base text-midnight_text dark:text-white"
                  >
                    {t('contact.form.date') || 'Date'}*
                  </label>
                  <input
                    id="date"
                    {...register('date')}
                    className="w-full text-base px-4 rounded-lg py-2.5 outline-hidden dark:text-white dark:bg-darkmode border-border border-solid border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0"
                    type="date"
                  />
                </div>
                <div className="mx-0 my-2.5 flex-1">
                  <label
                    htmlFor="time"
                    className="pb-3 inline-block text-base text-midnight_text dark:text-white"
                  >
                    {t('contact.form.time') || 'Time'}*
                  </label>
                  <input
                    id="time"
                    {...register('time')}
                    className="w-full text-base px-4 rounded-lg py-2.5 border-border outline-hidden dark:text-white dark:bg-darkmode border-solid border transition-all duration-500 focus:border-primary dark:focus:border-primary dark:border-dark_border focus:border-solid focus:outline-0"
                    type="time"
                  />
                </div>
              </div>
              <div className="mx-0 my-2.5 w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary rounded-lg text-white py-4 px-8 mt-4 inline-block hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      {t('contact.form.sending') || 'Sending...'}
                    </>
                  ) : (
                    t('contact.form.makeAppointment') || 'Make an appointment'
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div className="col-span-6">
            <div className="relative w-full h-full min-h-[500px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="text-6xl font-bold text-primary">24/7</div>
                <div className="text-xl text-grey dark:text-white/70">
                  {t('contact.form.available') || 'Available for Consultation'}
                </div>
                <p className="text-grey dark:text-white/70 max-w-md">
                  {t('contact.form.description') || 'Get expert advice and consultation from our team of professionals.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

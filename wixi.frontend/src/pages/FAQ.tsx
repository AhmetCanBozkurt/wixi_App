import React from 'react';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/language-context';

const FAQ: React.FC = () => {
  const { t } = useLanguage();

  const faqCategories = [
    {
      title: t('faq.category.general'),
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        { question: t('faq.general.q1'), answer: t('faq.general.a1') },
        { question: t('faq.general.q2'), answer: t('faq.general.a2') },
        { question: t('faq.general.q3'), answer: t('faq.general.a3') },
        { question: t('faq.general.q4'), answer: t('faq.general.a4') },
      ],
    },
    {
      title: t('faq.category.ausbildung'),
      icon: <MessageCircle className="h-5 w-5" />,
      questions: [
        { question: t('faq.ausbildung.q1'), answer: t('faq.ausbildung.a1') },
        { question: t('faq.ausbildung.q2'), answer: t('faq.ausbildung.a2') },
        { question: t('faq.ausbildung.q3'), answer: t('faq.ausbildung.a3') },
        { question: t('faq.ausbildung.q4'), answer: t('faq.ausbildung.a4') },
      ],
    },
    {
      title: t('faq.category.university'),
      icon: <Phone className="h-5 w-5" />,
      questions: [
        { question: t('faq.university.q1'), answer: t('faq.university.a1') },
        { question: t('faq.university.q2'), answer: t('faq.university.a2') },
        { question: t('faq.university.q3'), answer: t('faq.university.a3') },
        { question: t('faq.university.q4'), answer: t('faq.university.a4') },
      ],
    },
    {
      title: t('faq.category.work'),
      icon: <Mail className="h-5 w-5" />,
      questions: [
        { question: t('faq.work.q1'), answer: t('faq.work.a1') },
        { question: t('faq.work.q2'), answer: t('faq.work.a2') },
        { question: t('faq.work.q3'), answer: t('faq.work.a3') },
        { question: t('faq.work.q4'), answer: t('faq.work.a4') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{t('faq.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {category.icon}
                  <CardTitle className="text-2xl">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">{t('faq.contact.title')}</h3>
              <p className="text-muted-foreground mb-6">{t('faq.contact.subtitle')}</p>
              <div className="flex justify-center">
                <Button size="lg" asChild>
                  <a href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t('faq.contact.button')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">{t('faq.tips.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Tipp 1</Badge>
                <CardTitle className="text-lg">{t('faq.tips.tip1.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{t('faq.tips.tip1.desc')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Tipp 2</Badge>
                <CardTitle className="text-lg">{t('faq.tips.tip2.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{t('faq.tips.tip2.desc')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">Tipp 3</Badge>
                <CardTitle className="text-lg">{t('faq.tips.tip3.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{t('faq.tips.tip3.desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;



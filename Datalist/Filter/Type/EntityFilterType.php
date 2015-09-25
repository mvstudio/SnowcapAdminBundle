<?php

namespace Snowcap\AdminBundle\Datalist\Filter\Type;

use Snowcap\AdminBundle\Datalist\Filter\DatalistFilterExpressionBuilder;
use Snowcap\AdminBundle\Datalist\Filter\DatalistFilterInterface;
use Snowcap\AdminBundle\Datalist\Filter\Expression\ComparisonExpression;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class EntityFilterType
 * @package Snowcap\AdminBundle\Datalist\Filter\Type
 */
class EntityFilterType extends AbstractFilterType
{
    /**
     * @param \Symfony\Component\OptionsResolver\OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver
            ->setDefaults(array('query_builder' => null, 'multiple' => false))
            ->setRequired(array('class'))
            ->setDefined(array('choices', 'property', 'empty_value', 'group_by', 'attr'));
    }

    /**
     * @param \Symfony\Component\Form\FormBuilderInterface $builder
     * @param \Snowcap\AdminBundle\Datalist\Filter\DatalistFilterInterface $filter
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, DatalistFilterInterface $filter, array $options)
    {
        $formOptions = array(
            'class' => $options['class'],
            'label' => $options['label'],
            'query_builder' => $options['query_builder'],
            'required' => false,
            'multiple' => $options['multiple']
        );
        if(isset($options['choices'])) {
            $formOptions['choices'] = $options['choices'];
        }
        if(isset($options['property'])) {
            $formOptions['property'] = $options['property'];
        }
        if (isset($options['empty_value'])) {
            $formOptions['empty_value'] = $options['empty_value'];
        }
        if (isset($options['group_by'])) {
            $formOptions['group_by'] = $options['group_by'];
        }
        if (isset($options['attr'])) {
            $formOptions['attr'] = $options['attr'];
        }

        $builder->add($filter->getName(), 'entity', $formOptions);
    }

    /**
     * @param \Snowcap\AdminBundle\Datalist\Filter\DatalistFilterExpressionBuilder $builder
     * @param \Snowcap\AdminBundle\Datalist\Filter\DatalistFilterInterface $filter
     * @param mixed $value
     * @param array $options
     */
    public function buildExpression(DatalistFilterExpressionBuilder $builder, DatalistFilterInterface $filter, $value, array $options)
    {
        $operator = true === $options['multiple'] ? ComparisonExpression::OPERATOR_IN : ComparisonExpression::OPERATOR_EQ;
        $builder->add(new ComparisonExpression($filter->getPropertyPath(), $operator, $value));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'entity';
    }

    /**
     * @return string
     */
    public function getBlockName()
    {
        return 'entity';
    }
}
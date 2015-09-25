<?php

namespace Snowcap\AdminBundle\Datalist\Filter\Type;

use Snowcap\AdminBundle\Datalist\Filter\DatalistFilterExpressionBuilder;
use Snowcap\AdminBundle\Datalist\Filter\DatalistFilterInterface;
use Snowcap\AdminBundle\Datalist\Filter\Expression\CombinedExpression;
use Snowcap\AdminBundle\Datalist\Filter\Expression\ComparisonExpression;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\FormBuilderInterface;

/**
 * Class SearchFilterType
 * @package Snowcap\AdminBundle\Datalist\Filter\Type
 */
class SearchFilterType extends AbstractFilterType
{
    /**
     * @param \Symfony\Component\OptionsResolver\OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver
            ->setRequired(array('search_fields'));
    }

    /**
     * @param \Symfony\Component\Form\FormBuilderInterface $builder
     * @param \Snowcap\AdminBundle\Datalist\Filter\DatalistFilterInterface $filter
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, DatalistFilterInterface $filter, array $options)
    {
        $builder->add($filter->getName(), 'search', array(
            'label' => $options['label']
        ));
    }

    /**
     * @param \Snowcap\AdminBundle\Datalist\Filter\DatalistFilterExpressionBuilder $builder
     * @param \Snowcap\AdminBundle\Datalist\Filter\DatalistFilterInterface $filter
     * @param mixed $value
     * @param array $options
     */
    public function buildExpression(DatalistFilterExpressionBuilder $builder, DatalistFilterInterface $filter, $value, array $options)
    {
        if(is_array($options['search_fields'])) {
            $expression = new CombinedExpression(CombinedExpression::OPERATOR_OR);
            foreach($options['search_fields'] as $searchField) {
                $comparisonExpression = new ComparisonExpression($searchField, ComparisonExpression::OPERATOR_LIKE, $value);
                $expression->addExpression($comparisonExpression);
            }
        }
        else {
            $expression = new ComparisonExpression($options['search_fields'], ComparisonExpression::OPERATOR_LIKE, $value);
        }
        $builder->add($expression);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'search';
    }

    /**
     * @return string
     */
    public function getBlockName()
    {
        return 'search';
    }
}
<?php

namespace Snowcap\AdminBundle\Datalist\Field\Type;

use Snowcap\AdminBundle\Datalist\Field\DatalistFieldInterface;
use Snowcap\AdminBundle\Datalist\ViewContext;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class LabelFieldType
 * @package Snowcap\AdminBundle\Datalist\Field\Type
 */
class LabelFieldType extends AbstractFieldType
{
    /**
     * @param \Symfony\Component\OptionsResolver\OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver
            ->setRequired(array('mappings'))
            ->setAllowedTypes('mappings', 'array')
        ;
    }

    /**
     * @param \Snowcap\AdminBundle\Datalist\ViewContext $viewContext
     * @param \Snowcap\AdminBundle\Datalist\Field\DatalistFieldInterface $field
     * @param $row
     * @param array $options
     * @throws \UnexpectedValueException
     * @throws \Exception
     */
    public function buildViewContext(ViewContext $viewContext, DatalistFieldInterface $field, $row, array $options)
    {
        parent::buildViewContext($viewContext, $field, $row, $options);

        $mappings = $options['mappings'];

        // Convert boolean value to integer to avoid problem with indexed arrays
        if (is_bool($viewContext['value'])) {
            $viewContext['value'] = (int) $viewContext['value'];
        }
        if(!array_key_exists($viewContext['value'], $mappings)) {
            throw new \UnexpectedValueException(sprintf('No mapping for value %s', $viewContext['value']));
        }

        $mapping = $mappings[$viewContext['value']];
        if(!is_array($mapping)) {
            throw new \Exception('mappings for the label field type must be specified as an associative array');
        }

        $viewContext['attr'] = isset($mapping['attr']) ? $mapping['attr'] : array();
        $viewContext['value'] = $mapping['label'];
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'label';
    }

    /**
     * @return string
     */
    public function getBlockName()
    {
        return 'label';
    }
}
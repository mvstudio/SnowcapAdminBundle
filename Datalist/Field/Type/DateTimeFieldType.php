<?php

namespace Snowcap\AdminBundle\Datalist\Field\Type;

use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class DateTimeFieldType
 * @package Snowcap\AdminBundle\Datalist\Field\Type
 */
class DateTimeFieldType extends AbstractFieldType
{
    /**
     * @param \Symfony\Component\OptionsResolver\OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults(array(
            'format' => 'd/m/Y'
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'datetime';
    }

    /**
     * @return string
     */
    public function getBlockName()
    {
        return 'datetime';
    }
}
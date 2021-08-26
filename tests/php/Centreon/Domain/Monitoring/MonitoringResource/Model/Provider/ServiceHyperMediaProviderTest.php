<?php

/*
 * Copyright 2005 - 2021 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */

declare(strict_types=1);

namespace Tests\Centreon\Domain\Monitoring\MonitoringResource\Model\Provider;

use PHPUnit\Framework\TestCase;
use Centreon\Domain\Contact\Contact;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Centreon\Domain\Monitoring\MonitoringResource\Model\Provider\ServiceHyperMediaProvider;

class ServiceHyperMediaProviderTest extends TestCase
{
    /**
     * @var array<string, mixed>
     */
    private $serviceMonitoringResource;

    /**
     * @var Contact
     */
    private $adminContact;

    /**
     * @var Contact
     */
    private $nonAdminContact;

    /**
     * @var array<string, string>
     */
    private $uriLinksExpected;

    /**
     * @var UrlGeneratorInterface|\PHPUnit\Framework\MockObject\MockObject
     */
    private $urlGenerator;

    /**
     * @var ServiceHyperMediaProvider
     */
    private $serviceHyperMediaProviderService;

    protected function setUp(): void
    {
        $kernel = new \App\Kernel('test', false);
        $kernel->boot();

        $this->serviceMonitoringResource = [
            'id' => 1,
            'name' => 'Cpu',
            'type' => 'service',
            'parent' => [
                'id' => 10,
                'name' => 'Centreon-Central',
                'type' => 'host'
            ]
        ];

        $this->adminContact = (new Contact())
            ->setId(1)
            ->setName('admin')
            ->setAdmin(true);

        $this->nonAdminContact = (new Contact())
            ->setId(2)
            ->setName('nonAdmin')
            ->setAdmin(false);

        $this->urlGenerator = $this->createMock(UrlGeneratorInterface::class);
        $this->serviceHyperMediaProviderService = new ServiceHyperMediaProvider($this->urlGenerator);

        $this->uriLinksExpected = [
            'configuration' => '/main.php?p=60201&o=c&service_id=1',
            'logs' => '/main.php?p=20301&svc=10_1',
            'reporting' => '/main.php?p=30702&period=yesterday&start=&end=&host_id=10&item=1'
        ];
    }

    /**
     * test uris generation with admin contact
     */
    public function testGenerateUrisWithAdminContact(): void
    {
        $generatedUris = $this->serviceHyperMediaProviderService->generateUris(
            $this->serviceMonitoringResource,
            $this->adminContact
        );

        $this->assertEquals($this->uriLinksExpected['configuration'], $generatedUris['configuration']);
        $this->assertEquals($this->uriLinksExpected['logs'], $generatedUris['logs']);
    }

    /**
     * test uris generation with non admin contact
     */
    public function testGenerateUrisWithNonAdminContact(): void
    {
        $generatedUris = $this->serviceHyperMediaProviderService->generateUris(
            $this->serviceMonitoringResource,
            $this->nonAdminContact
        );

        $this->assertNull($generatedUris['logs']);
        $this->assertNull($generatedUris['configuration']);
    }
}
